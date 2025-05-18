import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService, authService } from '../services/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import {
  FaBox,
  FaSearch,
  FaFilter,
  FaRegClock,
  FaCheckCircle,
  FaTruck,
  FaClipboardList,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaTimesCircle,
  FaHome,
  FaSync,
  FaEye,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaMobileAlt,
  FaCreditCard,
  FaArrowLeft
} from 'react-icons/fa';

// Helper function to capitalize text
const capitalize = (text) => {
  if (!text) return '';
  return text.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [latestOrderId, setLatestOrderId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('order_id');
    const orderNumber = queryParams.get('order_number');
    const transactionParam = queryParams.get('transaction');
    
    // Set search term based on any available identifier
    if (orderNumber) {
      setSearchTerm(orderNumber);
      setSuccessMessage(`Thank you! Your order #${orderNumber} has been placed successfully. You can track its status here.`);
    } else if (transactionParam) {
      setSearchTerm(transactionParam);
      setSuccessMessage(`Thank you! Your order #${transactionParam} has been placed successfully. You can track its status here.`);
    } else if (orderId) {
      setSearchTerm(orderId);
      setSuccessMessage(`Thank you! Your order has been placed successfully. You can track its status here.`);
    }
    
    // Store the orderId for potential refetching
    if (orderId) {
      setLatestOrderId(orderId);
    }
  }, [location]);

  // Memoized fetch orders function to prevent recreation on each render
  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    try {
      // Force a refresh by adding a timestamp
      const params = { 
        refresh: Date.now(),
        per_page: 50 // Get a good number of orders to make sure we include the recent one
      };
      
      const response = await orderService.getOrders(params);
      
      if (response.success) {
        const ordersData = response.orders || [];
        setOrders(ordersData);
        
        // If we have no orders, but we should have a recent one
        if (ordersData.length === 0 && (latestOrderId || searchTerm)) {
          // Wait a moment and try again with a different timestamp
          setTimeout(async () => {
            try {
              const retryResponse = await orderService.getOrders({ 
                refresh: Date.now() + 1000, // different timestamp
                per_page: 50
              });
              
              if (retryResponse.success && retryResponse.orders?.length > 0) {
                setOrders(retryResponse.orders);
              }
            } catch (error) {
              console.error('Error on retry fetch:', error);
            } finally {
              setRefreshing(false);
            }
          }, 1000);
        } else {
          setRefreshing(false);
        }
      } else {
        setError(response.message || 'Failed to load orders');
        setRefreshing(false);
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError('Failed to load orders. Please try again later.');
      setRefreshing(false);
    } finally {
      setLoading(false);
    }
  }, [latestOrderId, searchTerm]);

  // Fetch all orders
  useEffect(() => {
    fetchOrders();
    
    // Set up auto-refresh every 60 seconds for active orders
    const intervalId = setInterval(() => {
      if (orders.some(order => 
        order.status === 'pending' || 
        order.status === 'processing' || 
        order.status === 'in_transit'
      )) {
        fetchOrders();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  // Filter orders based on search term and status filter
  useEffect(() => {
    let result = orders;
    
    // Filter by search term - Check multiple fields
    if (searchTerm) {
      result = result.filter(order => 
        String(order.id || '').includes(searchTerm) ||
        String(order.order_number || '').includes(searchTerm) ||
        String(order.transaction_number || '').includes(searchTerm) ||
        String(order.total || '').includes(searchTerm)
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => 
        (order.status || '').toLowerCase() === statusFilter
      );
    }
    
    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };
  
  const handleRefresh = () => {
    fetchOrders();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  const getStatusBadge = (status) => {
    let color = '';
    let icon = null;
    let text = getStatusText(status);
    
    switch(status?.toLowerCase()) {
      case 'completed':
        color = 'bg-green-100 text-green-800';
        icon = <FaCheckCircle size={14} />;
        break;
      case 'processing':
        color = 'bg-blue-100 text-blue-800';
        icon = <FaBox size={14} />;
        break;
      case 'in_transit':
        color = 'bg-indigo-100 text-indigo-800';
        icon = <FaTruck size={14} />;
        break;
      case 'cancelled':
        color = 'bg-red-100 text-red-800';
        icon = <FaTimesCircle size={14} />;
        break;
      case 'pending':
      default:
        color = 'bg-yellow-100 text-yellow-800';
        icon = <FaRegClock size={14} />;
    }
    
    return (
      <span className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full ${color}`}>
        <span className="mr-1">{icon}</span>
        <span>{text}</span>
      </span>
    );
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

  // Order status progressbar percentage
  const getProgressPercentage = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return '100%';
      case 'in_transit':
        return '75%';
      case 'processing':
        return '50%';
      case 'pending':
        return '25%';
      case 'cancelled':
        return '100%';
      default:
        return '25%';
    }
  };

  // Order status progress color
  const getProgressColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in_transit':
        return 'bg-indigo-500';
      case 'processing':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const filterButtons = [
    { label: 'All', value: 'all', icon: <FaClipboardList /> },
    { label: 'Pending', value: 'pending', icon: <FaRegClock /> },
    { label: 'Processing', value: 'processing', icon: <FaBox /> },
    { label: 'In Transit', value: 'in_transit', icon: <FaTruck /> },
    { label: 'Delivered', value: 'completed', icon: <FaCheckCircle /> },
    { label: 'Cancelled', value: 'cancelled', icon: <FaTimesCircle /> }
  ];

  // Group orders by active vs. completed/cancelled
  const activeOrders = filteredOrders.filter(order => 
    ['pending', 'processing', 'in_transit'].includes(order.status?.toLowerCase())
  );
  
  const completedOrders = filteredOrders.filter(order => 
    ['completed', 'cancelled'].includes(order.status?.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        setIsAuthModalOpen={setIsAuthModalOpen}
        setIsCartOpen={setIsCartOpen}
        isLoggedIn={true}
        setIsLoggedIn={() => {}}
      />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <Sidebar onLogout={handleLogout} />
        
        {/* Main Content - Fixed the scrolling issues by using proper overflow handling */}
        <div className="w-full lg:ml-64 h-full overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Page Title */}
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">My Orders</h1>
                <p className="text-gray-600">View and track all your orders in one place.</p>
              </div>
              <button 
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors mt-4 sm:mt-0"
                disabled={refreshing}
              >
                <FaSync className={refreshing ? "animate-spin" : ""} />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
            
            {/* Success message when redirected from checkout */}
            {successMessage && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaCheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                  </div>
                  <button
                    onClick={() => setSuccessMessage('')}
                    className="ml-auto text-green-500 hover:text-green-700"
                    aria-label="Dismiss"
                  >
                    <FaTimesCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Search and Filter Bar - Improved responsiveness */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Search */}
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Filter Buttons - Now scrollable on mobile */}
                <div className="overflow-x-auto whitespace-nowrap py-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex md:flex-wrap md:gap-2">
                  {filterButtons.map(button => (
                    <button
                      key={button.value}
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium mr-2 md:mr-0 ${
                        statusFilter === button.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setStatusFilter(button.value)}
                    >
                      <span className="mr-1.5">{button.icon}</span>
                      <span>{button.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Orders List */}
            {error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm" role="alert">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline ml-2">{error}</span>
                </div>
                <button
                  className="mt-4 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-2 px-4 rounded"
                  onClick={handleRefresh}
                >
                  Retry
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <FaBox className="mx-auto text-gray-300 text-5xl mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
                <p className="text-gray-600 mb-6 px-4">
                  {orders.length === 0
                    ? "You haven't placed any orders yet."
                    : "No orders match your current filters."
                  }
                </p>
                {orders.length === 0 && (
                  <button
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FaHome className="mr-2" /> Browse Products
                  </button>
                )}
                {orders.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FaFilter className="mr-2" /> Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Orders Section - Improved card layout */}
                {activeOrders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <FaTruck className="mr-2 text-indigo-500" /> Active Orders ({activeOrders.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {activeOrders.map((order) => (
                        <div 
                          key={order.id || order.order_number} 
                          className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow p-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Order Info */}
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-purple-100 rounded-md">
                                <FaBox className="text-purple-600" />
                              </div>
                              <div className="ml-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-sm font-bold text-gray-900">
                                    {order.order_number ? `#${order.order_number}` : `Order ID: ${order.id}`}
                                  </div>
                                  {getStatusBadge(order.status)}
                                </div>
                                <div className="text-sm text-gray-500 mt-1 flex items-center">
                                  <FaCalendarAlt className="mr-1 text-gray-400" />
                                  {formatDate(order.created_at)}
                                </div>
                                <div className="flex items-center mt-1 text-sm text-gray-700">
                                  {getPaymentMethodIcon(order.payment_method)}
                                  <span className="ml-1.5">
                                    {order.payment_method === 'cash' ? 'Cash on Delivery' : 
                                    order.payment_method === 'mobile_money' ? 'Mobile Money' :
                                    order.payment_method === 'account' ? 'Credit Account' :
                                    capitalize(order.payment_method?.replace('_', ' ') || 'N/A')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:items-end gap-2">
                              <div className="text-lg font-medium text-gray-900">
                                KSh {parseFloat(order.total || 0).toLocaleString()}
                              </div>
                              <button
                                onClick={() => navigate(`/orders/${order.id}`)}
                                className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center"
                              >
                                <FaEye className="mr-2" /> View Details
                              </button>
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="mt-4 w-full">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                              <div 
                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getProgressColor(order.status)}`} 
                                style={{width: getProgressPercentage(order.status)}}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Past Orders Section - Improved responsive table */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    {activeOrders.length > 0 ? 
                      <><FaClipboardList className="mr-2 text-gray-500" /> Past Orders ({completedOrders.length})</> : 
                      <><FaClipboardList className="mr-2 text-gray-500" /> All Orders ({filteredOrders.length})</>
                    }
                  </h2>
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order Information
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(activeOrders.length > 0 ? completedOrders : filteredOrders).map((order) => (
                            <tr key={order.id || order.order_number} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-purple-100 rounded-md">
                                    <FaBox className="text-purple-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {order.order_number ? `#${order.order_number}` : `Order ID: ${order.id}`}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {order.transaction_number && (
                                        <span>Trans #{order.transaction_number}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                                <div className="text-xs text-gray-500">
                                  {order.created_at ? new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  KSh {parseFloat(order.total || 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  {getPaymentMethodIcon(order.payment_method)}
                                  <span className="ml-1.5">
                                    {order.payment_method === 'cash' ? 'Cash' : 
                                    order.payment_method === 'mobile_money' ? 'Mobile' :
                                    order.payment_method === 'account' ? 'Credit' :
                                    capitalize(order.payment_method?.slice(0, 6) || 'N/A')}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(order.status)}
                                {order.status === 'completed' && order.completed_at && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {formatDate(order.completed_at)}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => navigate(`/orders/${order.id}`)}
                                  className="text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded font-medium transition-colors"
                                  disabled={!order.id}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;