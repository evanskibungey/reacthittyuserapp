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
  FaSync
} from 'react-icons/fa';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchOrderDetails = async () => {
    setRefreshing(true);
    try {
      const response = await orderService.getOrder(id);
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
    
    // Poll for updates every 30 seconds if the order is in a non-final state
    // Poll more frequently (every 15 seconds) for cash orders with pending payment status
    const intervalId = setInterval(() => {
      if (order) {
        // Check if we should refresh based on order status or payment status
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
    }, 15000); // Poll every 15 seconds to be more responsive to payment status changes
    
    return () => clearInterval(intervalId);
  }, [id]);

  const handleRefresh = () => {
    fetchOrderDetails();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const getStatusText = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'Delivered';
      case 'processing':
        return 'Ready for Pickup';
      case 'in_transit':
        return 'In Transit';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
      default:
        return 'Order Received';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'processing':
        return <FaBox className="text-blue-500" />;
      case 'in_transit':
        return <FaTruck className="text-indigo-500" />;
      case 'cancelled':
        return <FaTimes className="text-red-500" />;
      case 'pending':
      default:
        return <FaRegClock className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getPaymentMethodIcon = (method) => {
    switch(method?.toLowerCase()) {
      case 'cash':
        return <FaMoneyBillWave className="text-green-500" />;
      case 'mobile_money':
        return <FaMobileAlt className="text-purple-500" />;
      case 'account':
        return <FaCreditCard className="text-blue-500" />;
      default:
        return <FaCreditCard className="text-gray-500" />;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" /> Paid
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" /> Pending
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <FaTimes className="mr-1" /> {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        setIsAuthModalOpen={setIsAuthModalOpen}
        setIsCartOpen={setIsCartOpen}
        isLoggedIn={true}
        setIsLoggedIn={() => {}}
      />
      
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar onLogout={handleLogout} />
        
        {/* Main Content */}
        <div className="ml-64 w-full pt-16 px-8 pb-8 overflow-y-auto">
          {order ? (
            <>
              {/* Back button and Order Title */}
              <div className="mb-8">
                <button 
                  onClick={() => navigate('/orders')}
                  className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Orders
                </button>
                
                <div className="flex flex-wrap justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Order #{order.order_number || order.id}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleRefresh} 
                      className={`text-purple-600 hover:text-purple-800 p-2 rounded-full ${refreshing ? 'animate-spin' : ''}`}
                      disabled={refreshing}
                    >
                      <FaSync />
                    </button>
                    <span className="text-gray-500 flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-400" />
                      {formatDateTime(order.placed_at || order.created_at)}
                    </span>
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      <span className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusText(order.status)}</span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Order Progress Tracker */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">Order Progress</h2>
                </div>
                <div className="p-6">
                  {/* Progress Bar */}
                  <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
                    {order.status === 'pending' && (
                      <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500" style={{width: '25%'}}></div>
                    )}
                    {order.status === 'processing' && (
                      <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500" style={{width: '50%'}}></div>
                    )}
                    {order.status === 'in_transit' && (
                      <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500" style={{width: '75%'}}></div>
                    )}
                    {order.status === 'completed' && (
                      <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500" style={{width: '100%'}}></div>
                    )}
                    {order.status === 'cancelled' && (
                      <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500" style={{width: '100%'}}></div>
                    )}
                  </div>
                  
                  {/* Steps */}
                  <div className="flex justify-between">
                    {/* Step 1: Order Confirmed */}
                    <div className="text-center">
                      <div className="relative">
                        <div className={`rounded-full h-10 w-10 flex items-center justify-center text-white mx-auto ${
                          ['pending', 'processing', 'in_transit', 'completed'].includes(order.status) 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}>
                          <FaClipboardList />
                        </div>
                      </div>
                      <div className={`text-xs mt-2 font-medium ${
                        ['pending', 'processing', 'in_transit', 'completed'].includes(order.status) 
                          ? 'text-green-700' 
                          : 'text-gray-500'
                      }`}>
                        Order Confirmed
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(order.placed_at || order.created_at).split(',')[0]}
                      </div>
                    </div>
                    
                    {/* Step 2: Ready for Pickup */}
                    <div className="text-center">
                      <div className="relative">
                        <div className={`rounded-full h-10 w-10 flex items-center justify-center text-white mx-auto ${
                          ['processing', 'in_transit', 'completed'].includes(order.status) 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300'
                        }`}>
                          <FaBox />
                        </div>
                      </div>
                      <div className={`text-xs mt-2 font-medium ${
                        ['processing', 'in_transit', 'completed'].includes(order.status) 
                          ? 'text-blue-700' 
                          : 'text-gray-500'
                      }`}>
                        Ready for Pickup
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.confirmed_at ? formatDateTime(order.confirmed_at).split(',')[0] : '-'}
                      </div>
                    </div>
                    
                    {/* Step 3: In Transit */}
                    <div className="text-center">
                      <div className="relative">
                        <div className={`rounded-full h-10 w-10 flex items-center justify-center text-white mx-auto ${
                          ['in_transit', 'completed'].includes(order.status) 
                            ? 'bg-indigo-500' 
                            : 'bg-gray-300'
                        }`}>
                          <FaTruck />
                        </div>
                      </div>
                      <div className={`text-xs mt-2 font-medium ${
                        ['in_transit', 'completed'].includes(order.status) 
                          ? 'text-indigo-700' 
                          : 'text-gray-500'
                      }`}>
                        In Transit
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.in_transit_at ? formatDateTime(order.in_transit_at).split(',')[0] : '-'}
                      </div>
                    </div>
                    
                    {/* Step 4: Delivered */}
                    <div className="text-center">
                      <div className="relative">
                        <div className={`rounded-full h-10 w-10 flex items-center justify-center text-white mx-auto ${
                          order.status === 'completed' 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}>
                          <FaCheckCircle />
                        </div>
                      </div>
                      <div className={`text-xs mt-2 font-medium ${
                        order.status === 'completed' 
                          ? 'text-green-700' 
                          : 'text-gray-500'
                      }`}>
                        Delivered
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.completed_at ? formatDateTime(order.completed_at).split(',')[0] : '-'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Message */}
                  {order.status === 'pending' && (
                    <div className="mt-6 text-center bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800 flex items-center justify-center">
                        <FaInfoCircle className="mr-2" /> Your order is being processed. We'll update you once it's ready for delivery.
                      </p>
                    </div>
                  )}
                  
                  {order.status === 'processing' && (
                    <div className="mt-6 text-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 flex items-center justify-center">
                        <FaInfoCircle className="mr-2" /> Your order is ready for pickup. A rider will be assigned soon!
                      </p>
                    </div>
                  )}
                  
                  {order.status === 'in_transit' && (
                    <div className="mt-6 text-center bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                      <p className="text-sm text-indigo-800 flex items-center justify-center">
                        <FaInfoCircle className="mr-2" /> Your order is on the way! The rider is en route to your location.
                      </p>
                    </div>
                  )}
                  
                  {order.status === 'completed' && (
                    <div className="mt-6 text-center bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 flex items-center justify-center">
                        <FaCheckCircle className="mr-2" /> Your order has been delivered successfully. Thank you for your business!
                      </p>
                    </div>
                  )}
                  
                  {order.status === 'cancelled' && (
                    <div className="mt-6 text-center bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800 flex items-center justify-center">
                        <FaTimes className="mr-2" /> This order has been cancelled. Please contact support for more information.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Order Summary Card */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-800 font-medium">KSh {order.subtotal}</span>
                    </div>
                    
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-KSh {order.discount}</span>
                      </div>
                    )}
                    
                    {order.delivery_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span className="text-gray-800 font-medium">KSh {order.delivery_fee}</span>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-100 flex justify-between">
                      <span className="text-gray-800 font-bold">Total:</span>
                      <span className="text-gray-800 font-bold">KSh {order.total}</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Information */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Payment Information</h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-6 bg-gray-50 p-4 rounded-lg">
                      <div className="p-3 bg-gray-100 rounded-full mr-3">
                        {getPaymentMethodIcon(order.payment_method)}
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Payment Method</p>
                        <p className="text-gray-900 font-medium">
                          {order.payment_method === 'cash' ? 'Cash on Delivery' : 
                           order.payment_method === 'mobile_money' ? 'Mobile Money' :
                           order.payment_method === 'account' ? 'Credit Account' :
                           order.payment_method || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                      <div className="p-3 bg-gray-100 rounded-full mr-3">
                        {order.payment_status === 'paid' ? 
                          <FaCheckCircle className="text-green-500" /> : 
                          <FaClock className="text-yellow-500" />}
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Payment Status</p>
                        <div className="mt-1">
                          {getPaymentStatusBadge(order.payment_status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Information */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Delivery Information</h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start mb-6 bg-gray-50 p-4 rounded-lg">
                      <FaMapMarkerAlt className="mr-3 mt-1 text-purple-500" />
                      <div>
                        <p className="text-gray-600 text-sm">Delivery Address</p>
                        <p className="text-gray-800 font-medium">{order.delivery_address || 'No address provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                      <FaPhoneAlt className="mr-3 mt-1 text-green-500" />
                      <div>
                        <p className="text-gray-600 text-sm">Contact Information</p>
                        {order.customer_phone ? (
                          <p className="text-gray-800 font-medium">{order.customer_phone}</p>
                        ) : (
                          <p className="text-gray-500 italic">Using account phone number</p>
                        )}
                        {order.status === 'in_transit' && (
                          <div className="mt-3">
                            <p className="text-sm text-indigo-700">The rider will call you when they arrive.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">Order Items</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3">Quantity</th>
                        <th className="px-6 py-3">Unit Price</th>
                        <th className="px-6 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items && order.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                <FaBox className="text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{item.product_name}</p>
                                <p className="text-sm text-gray-500">ID: {item.product_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                            KSh {item.unit_price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                            KSh {item.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center">
                  <FaInfoCircle className="mr-2" /> Need Help?
                </button>
                <button onClick={handleRefresh} className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium flex items-center">
                  <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Status
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FaBox className="mx-auto text-gray-300 text-5xl mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">The order you are looking for does not exist or has been removed.</p>
              <Link 
                to="/orders"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
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