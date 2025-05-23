import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService, authService } from '../services/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  FaBox, 
  FaTruck, 
  FaArrowLeft, 
  FaCalendarAlt,
  FaCreditCard,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaRegClock,
  FaClipboardList,
  FaMoneyBillWave,
  FaMobileAlt,
  FaPhoneAlt,
  FaInfoCircle,
  FaSync,
  FaShieldAlt,
  FaSpinner,
  FaStore,
  FaUserCircle
} from 'react-icons/fa';

// Custom hook for order data fetching and refreshing
const useOrderData = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrderDetails = async () => {
    setRefreshing(true);
    try {
      const response = await orderService.getOrder(orderId);
      console.log('Order details response:', response);
      
      if (response.success && response.order) {
        setOrder(response.order);
      } else {
        setError(response.message || 'Failed to load order details');
      }
    } catch (err) {
      setError('Error fetching order details. Please try again.');
      console.error('Order fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    
    const intervalId = setInterval(() => {
      if (order) {
        const needsFrequentRefresh = order.payment_method === 'cash' && 
                                     order.payment_status === 'pending' && 
                                     order.status === 'completed';
        
        const needsRegularRefresh = order.status === 'pending' || 
                                    order.status === 'processing' || 
                                    order.status === 'in_transit';
        
        if (needsFrequentRefresh || needsRegularRefresh) {
          fetchOrderDetails();
        }
      }
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, [orderId, order]);

  return { order, loading, error, refreshing, fetchOrderDetails };
};

// Status helper functions
const statusHelpers = {
  getStatusText: (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'Delivered';
      case 'processing': return 'Ready for Pickup';
      case 'in_transit': return 'In Transit';
      case 'cancelled': return 'Cancelled';
      case 'pending':
      default: return 'Order Received';
    }
  },
  
  getStatusIcon: (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return <FaCheckCircle className="text-emerald-500" />;
      case 'processing': return <FaBox className="text-blue-500" />;
      case 'in_transit': return <FaTruck className="text-purple-500" />;
      case 'cancelled': return <FaTimes className="text-red-500" />;
      case 'pending':
      default: return <FaRegClock className="text-amber-500" />;
    }
  },
  
  getStatusColor: (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-500';
      case 'processing': return 'bg-blue-500';
      case 'in_transit': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      case 'pending':
      default: return 'bg-amber-500';
    }
  },
  
  getStatusGradient: (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'from-emerald-400 to-emerald-600';
      case 'processing': return 'from-blue-400 to-blue-600';
      case 'in_transit': return 'from-purple-400 to-purple-600';
      case 'cancelled': return 'from-red-400 to-red-600';
      case 'pending':
      default: return 'from-amber-400 to-amber-600';
    }
  },
  
  getPaymentMethodIcon: (method) => {
    switch(method?.toLowerCase()) {
      case 'cash': return <FaMoneyBillWave className="text-emerald-500" />;
      case 'mobile_money': return <FaMobileAlt className="text-purple-500" />;
      case 'account': return <FaCreditCard className="text-blue-500" />;
      default: return <FaCreditCard className="text-gray-500" />;
    }
  },
  
  getPaymentStatusBadge: (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 items-center">
            <FaCheckCircle className="mr-1.5" /> Paid
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 items-center">
            <FaClock className="mr-1.5" /> Pending
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 items-center">
            <FaTimes className="mr-1.5" /> {status}
          </span>
        );
    }
  }
};

// Utility function for date formatting
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Order Header component with modern design
export const OrderHeader = ({ order, refreshing, onRefresh, navigate }) => (
  <div className="mb-8 animate-fadeIn">
    <button 
      onClick={() => navigate('/orders')}
      className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200 group"
    >
      <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
      <span className="font-medium">Back to Orders</span>
    </button>
    
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order #{order.order_number || order.id}
          </h1>
          <div className="flex items-center text-gray-500">
            <FaCalendarAlt className="mr-2 text-gray-400" />
            <span className="text-sm">{formatDateTime(order.placed_at || order.created_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onRefresh} 
            className={`p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 ${refreshing ? 'animate-spin' : 'hover:scale-105'}`}
            disabled={refreshing}
          >
            <FaSync className="text-lg" />
          </button>
          
          <div className={`px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${statusHelpers.getStatusGradient(order.status)} shadow-lg`}>
            <span className="flex items-center gap-2">
              {statusHelpers.getStatusIcon(order.status)}
              <span>{statusHelpers.getStatusText(order.status)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modern Progress Tracker component
const OrderProgressTracker = ({ order }) => {
  const steps = [
    { id: 'confirmed', label: 'Order Confirmed', icon: FaClipboardList, status: ['pending', 'processing', 'in_transit', 'completed'] },
    { id: 'processing', label: 'Ready for Pickup', icon: FaBox, status: ['processing', 'in_transit', 'completed'] },
    { id: 'in_transit', label: 'In Transit', icon: FaTruck, status: ['in_transit', 'completed'] },
    { id: 'completed', label: 'Delivered', icon: FaCheckCircle, status: ['completed'] }
  ];
  
  const isStepActive = (stepStatuses) => stepStatuses.includes(order.status);
  const currentStepIndex = steps.findIndex(step => step.status.includes(order.status) && !isStepActive(steps[steps.indexOf(step) + 1]?.status || []));
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg overflow-hidden mb-8 border border-purple-100 animate-fadeIn">
      <div className="px-8 py-6 bg-white bg-opacity-60 backdrop-blur-sm border-b border-purple-100">
        <h2 className="text-xl font-bold text-gray-800">Track Your Order</h2>
      </div>
      
      <div className="p-8">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-12 left-0 w-full h-1 bg-gray-200 rounded-full">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${statusHelpers.getStatusGradient(order.status)} transition-all duration-1000 ease-out`}
              style={{
                width: order.status === 'cancelled' ? '100%' : 
                       order.status === 'pending' ? '0%' :
                       order.status === 'processing' ? '33%' :
                       order.status === 'in_transit' ? '66%' :
                       order.status === 'completed' ? '100%' : '0%'
              }}
            />
          </div>
          
          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = isStepActive(step.status);
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className="text-center flex-1">
                  <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${
                    isActive 
                      ? `bg-gradient-to-br ${statusHelpers.getStatusGradient(order.status)} shadow-xl transform scale-110` 
                      : 'bg-gray-200'
                  } ${isCurrent ? 'animate-pulse' : ''}`}>
                    <Icon className={`text-3xl ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  
                  <div className={`mt-4 font-semibold text-sm transition-colors ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </div>
                  
                  {isActive && (
                    <div className="text-xs text-gray-500 mt-1">
                      {step.id === 'confirmed' && formatDateTime(order.placed_at || order.created_at).split(',')[0]}
                      {step.id === 'processing' && order.confirmed_at && formatDateTime(order.confirmed_at).split(',')[0]}
                      {step.id === 'in_transit' && order.in_transit_at && formatDateTime(order.in_transit_at).split(',')[0]}
                      {step.id === 'completed' && order.completed_at && formatDateTime(order.completed_at).split(',')[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Status Messages */}
        <div className="mt-10">
          {order.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 animate-slideUp">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FaInfoCircle className="text-amber-600 text-xl" />
              </div>
              <p className="text-sm text-amber-800">Your order is being processed. We'll update you once it's ready for delivery.</p>
            </div>
          )}
          
          {order.status === 'processing' && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3 animate-slideUp">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaStore className="text-blue-600 text-xl" />
              </div>
              <p className="text-sm text-blue-800">Your order is ready! A rider will be assigned shortly.</p>
            </div>
          )}
          
          {order.status === 'in_transit' && (
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center gap-3 animate-slideUp">
              <div className="p-2 bg-purple-100 rounded-lg animate-bounce">
                <FaTruck className="text-purple-600 text-xl" />
              </div>
              <p className="text-sm text-purple-800">Your order is on the way! The rider will contact you upon arrival.</p>
            </div>
          )}
          
          {order.status === 'completed' && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 animate-slideUp">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FaCheckCircle className="text-emerald-600 text-xl" />
              </div>
              <p className="text-sm text-emerald-800">Order delivered successfully! Thank you for your purchase.</p>
            </div>
          )}
          
          {order.status === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 animate-slideUp">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaTimes className="text-red-600 text-xl" />
              </div>
              <p className="text-sm text-red-800">This order has been cancelled. Please contact support for assistance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modern Summary Card
const OrderSummaryCard = ({ order }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fadeIn">
    <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
      <h2 className="text-lg font-bold text-white">Order Summary</h2>
    </div>
    
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Subtotal</span>
        <span className="text-gray-900 font-semibold text-lg">KSh {order.subtotal}</span>
      </div>
      
      {order.discount > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-emerald-600 flex items-center gap-1">
            <FaShieldAlt className="text-sm" />
            Discount
          </span>
          <span className="text-emerald-600 font-semibold">-KSh {order.discount}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <span className="text-gray-600 flex items-center gap-1">
          <FaTruck className="text-sm" />
          Delivery Fee
        </span>
        {order.delivery_fee > 0 ? (
          <span className="text-gray-900 font-semibold">KSh {order.delivery_fee}</span>
        ) : (
          <span className="text-green-600 font-semibold">FREE</span>
        )}
      </div>
      
      <div className="pt-4 mt-4 border-t-2 border-gray-100 flex justify-between items-center">
        <span className="text-gray-900 font-bold text-lg">Total</span>
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          KSh {order.total}
        </span>
      </div>
    </div>
  </div>
);

// Modern Payment Information Card
const PaymentInfoCard = ({ order }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fadeIn animation-delay-100">
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
      <h2 className="text-lg font-bold text-white">Payment Details</h2>
    </div>
    
    <div className="p-6 space-y-4">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-md">
            {statusHelpers.getPaymentMethodIcon(order.payment_method)}
          </div>
          <div>
            <p className="text-gray-500 text-sm">Payment Method</p>
            <p className="text-gray-900 font-bold">
              {order.payment_method === 'cash' ? 'Cash on Delivery' : 
               order.payment_method === 'mobile_money' ? 'Mobile Money' :
               order.payment_method === 'account' ? 'Credit Account' :
               order.payment_method || 'Not specified'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-md">
            {order.payment_status === 'paid' ? 
              <FaCheckCircle className="text-emerald-500 text-xl" /> : 
              <FaClock className="text-amber-500 text-xl" />}
          </div>
          <div>
            <p className="text-gray-500 text-sm">Payment Status</p>
            <div className="mt-1">
              {statusHelpers.getPaymentStatusBadge(order.payment_status)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modern Delivery Information Card
const DeliveryInfoCard = ({ order }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fadeIn animation-delay-200">
    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
      <h2 className="text-lg font-bold text-white">Delivery Information</h2>
    </div>
    
    <div className="p-6 space-y-4">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-md">
            <FaMapMarkerAlt className="text-purple-500 text-xl" />
          </div>
          <div className="flex-1">
            <p className="text-gray-500 text-sm">Delivery Address</p>
            <p className="text-gray-900 font-semibold mt-1">{order.delivery_address || 'No address provided'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-md">
            <FaPhoneAlt className="text-emerald-500 text-xl" />
          </div>
          <div className="flex-1">
            <p className="text-gray-500 text-sm">Contact Number</p>
            {order.customer_phone ? (
              <p className="text-gray-900 font-semibold mt-1">{order.customer_phone}</p>
            ) : (
              <p className="text-gray-500 italic mt-1">Using account phone</p>
            )}
            {order.status === 'in_transit' && (
              <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-2">
                <p className="text-xs text-purple-700">The rider will call when they arrive.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modern Order Items Table
const OrderItemsTable = ({ items }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 animate-fadeIn">
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
      <h2 className="text-lg font-bold text-white">Order Items</h2>
    </div>
    
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Quantity</th>
            <th className="px-6 py-4">Unit Price</th>
            <th className="px-6 py-4">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items && items.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                    <FaBox className="text-purple-600 text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-500">ID: {item.product_id}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-lg text-sm font-semibold">
                  {item.quantity}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-900 font-medium">
                KSh {item.unit_price}
              </td>
              <td className="px-6 py-4 font-bold text-gray-900">
                KSh {item.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Modern Action buttons
const OrderActions = ({ onRefresh, refreshing }) => (
  <div className="flex justify-end gap-4 animate-fadeIn">
    <button className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center gap-2 hover:scale-105">
      <FaInfoCircle /> 
      Need Help?
    </button>
    <button 
      onClick={onRefresh} 
      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center gap-2 hover:scale-105"
    >
      <FaSync className={refreshing ? 'animate-spin' : ''} /> 
      Refresh Status
    </button>
  </div>
);

// Loading state component
const LoadingState = () => (
  <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-pulse"></div>
      <div className="w-20 h-20 border-4 border-purple-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium animate-pulse">Loading order details...</p>
  </div>
);

// Error state component
const ErrorState = ({ error, onRetry }) => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FaTimes className="text-red-500 text-3xl" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button 
        onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Main OrderDetail component
const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { order, loading, error, refreshing, fetchOrderDetails } = useOrderData(id);
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchOrderDetails} />;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
      `}</style>
      
      {/* Fixed Header */}
      <div className="fixed w-full z-30 top-0 left-0 h-16 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <Header
          setIsAuthModalOpen={setIsAuthModalOpen}
          setIsCartOpen={setIsCartOpen}
          isLoggedIn={true}
          setIsLoggedIn={() => {}}
        />
      </div>
      
      {/* Fixed Sidebar */}
      <Sidebar onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="ml-64 mt-16 min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
        <div className="px-8 py-8">
          {order ? (
            <>
              <OrderHeader 
                order={order} 
                refreshing={refreshing} 
                onRefresh={fetchOrderDetails} 
                navigate={navigate}
              />
              
              <OrderProgressTracker order={order} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <OrderSummaryCard order={order} />
                <PaymentInfoCard order={order} />
                <DeliveryInfoCard order={order} />
              </div>
              
              <OrderItemsTable items={order.items} />
              
              <OrderActions onRefresh={fetchOrderDetails} refreshing={refreshing} />
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBox className="text-gray-400 text-4xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
              <Link 
                to="/orders"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold hover:scale-105"
              >
                <FaArrowLeft className="mr-2" />
                View Your Orders
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDetail;