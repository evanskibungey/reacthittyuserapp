import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderService, authService, profileService } from '../services/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import {
  FaBox,
  FaSearch,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSync,
  FaEye,
  FaMoneyBillWave,
  FaMobileAlt,
  FaCreditCard,
  FaCheckCircle,
  FaRegClock,
  FaTruck,
  FaClipboardList,
  FaChartLine,
  FaFilter,
  FaFilePdf,
  FaDownload,
  FaHistory,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarMonth,
  FaSortAmountDown,
  FaSortAmountUp,
  FaInfoCircle
} from 'react-icons/fa';

// Helper function to capitalize text
const capitalize = (text) => {
  if (!text) return '';
  return text.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return parseFloat(amount || 0).toLocaleString();
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [statistics, setStatistics] = useState({
    totalSpent: 0,
    avgOrderValue: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const navigate = useNavigate();

  // Calculate custom date range based on selection
  const getDateRange = () => {
    const now = new Date();
    let startDate = null;
    
    switch(dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return null; // All time
    }
    
    return startDate ? { from: startDate, to: new Date() } : null;
  };

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    try {
      // First get the customer info for context
      const profileResponse = await profileService.getProfile();
      if (profileResponse.success) {
        setCustomerInfo(profileResponse.data);
      }
      
      // Get all orders without pagination to build complete history
      const response = await orderService.getOrders({
        refresh: Date.now(),
        per_page: 100, // Get a larger number for complete history
        sort_by: 'created_at',
        sort_dir: 'desc'
      });
      
      if (response.success && response.orders) {
        const ordersData = response.orders || [];
        setOrders(ordersData);
        
        // Calculate statistics
        if (ordersData.length > 0) {
          const totalSpent = ordersData.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
          const completedOrders = ordersData.filter(order => order.status === 'completed').length;
          const cancelledOrders = ordersData.filter(order => order.status === 'cancelled').length;
          
          setStatistics({
            totalSpent,
            avgOrderValue: ordersData.length > 0 ? totalSpent / ordersData.length : 0,
            totalOrders: ordersData.length,
            completedOrders,
            cancelledOrders
          });
        }
      } else {
        setError(response.message || 'Failed to load order history');
      }
    } catch (err) {
      console.error('Order history fetch error:', err);
      setError('Failed to load order history. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...orders];
    
    // Date range filtering
    const range = getDateRange();
    if (range) {
      result = result.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= range.from && orderDate <= range.to;
      });
    }
    
    // Search term filtering
    if (searchTerm) {
      result = result.filter(order => 
        String(order.id || '').includes(searchTerm) ||
        String(order.order_number || '').includes(searchTerm) ||
        String(order.transaction_number || '').includes(searchTerm) ||
        String(order.total || '').includes(searchTerm)
      );
    }
    
    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'date':
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        case 'total':
          comparison = parseFloat(a.total || 0) - parseFloat(b.total || 0);
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredOrders(result);
  }, [orders, searchTerm, dateRange, sortBy, sortDirection]);

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
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
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

  // Calculate order statistics by month (for charts)
  const getMonthlyStats = () => {
    const monthlyData = {};
    
    orders.forEach(order => {
      if (!order.created_at) return;
      
      const date = new Date(order.created_at);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          count: 0,
          total: 0,
          label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        };
      }
      
      monthlyData[monthYear].count += 1;
      monthlyData[monthYear].total += parseFloat(order.total || 0);
    });
    
    return Object.values(monthlyData).slice(-6); // Last 6 months
  };

  // Format for readable display
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} months ago`;
    } else {
      return `${Math.floor(diffDays / 365)} years ago`;
    }
  };

  const dateFilterOptions = [
    { label: 'All Time', value: 'all', icon: <FaHistory /> },
    { label: 'Today', value: 'today', icon: <FaCalendarDay /> },
    { label: 'Last 7 Days', value: 'week', icon: <FaCalendarWeek /> },
    { label: 'Last 30 Days', value: 'month', icon: <FaCalendarMonth /> },
    { label: 'Last 3 Months', value: 'quarter', icon: <FaCalendarMonth /> },
    { label: 'Last Year', value: 'year', icon: <FaCalendarAlt /> }
  ];

  const sortOptions = [
    { label: 'Date', value: 'date' },
    { label: 'Amount', value: 'total' },
    { label: 'Status', value: 'status' }
  ];

  // Group by month/year for timeline view
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    if (!order.created_at) return groups;
    
    const date = new Date(order.created_at);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(order);
    return groups;
  }, {});

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
        
        {/* Main Content */}
        <div className="w-full lg:ml-64 h-full overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Order History</h1>
                <p className="text-gray-600">View and analyze your purchase history over time.</p>
              </div>
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <button 
                  onClick={handleRefresh}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  disabled={refreshing}
                >
                  <FaSync className={refreshing ? "animate-spin" : ""} />
                  <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                </button>
                <button
                  onClick={() => setIsInfoModalOpen(true)}
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Information"
                >
                  <FaInfoCircle />
                </button>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                  <FaClipboardList className="text-indigo-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{statistics.totalOrders}</p>
                <p className="text-xs text-gray-600 mt-1">All time</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
                  <FaMoneyBillWave className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800">KSh {formatCurrency(statistics.totalSpent)}</p>
                <p className="text-xs text-gray-600 mt-1">All time</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Avg. Order Value</h3>
                  <FaChartLine className="text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800">KSh {formatCurrency(statistics.avgOrderValue)}</p>
                <p className="text-xs text-gray-600 mt-1">All time</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Completed Orders</h3>
                  <FaCheckCircle className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{statistics.completedOrders}</p>
                <p className="text-xs text-gray-600 mt-1">{statistics.totalOrders > 0 ? `${Math.round((statistics.completedOrders / statistics.totalOrders) * 100)}%` : '0%'} success rate</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Cancelled Orders</h3>
                  <FaTimesCircle className="text-red-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{statistics.cancelledOrders}</p>
                <p className="text-xs text-gray-600 mt-1">{statistics.totalOrders > 0 ? `${Math.round((statistics.cancelledOrders / statistics.totalOrders) * 100)}%` : '0%'} cancellation rate</p>
              </div>
            </div>
            
            {/* Filters and Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search */}
                <div className="relative lg:w-64">
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
                
                {/* Date Range Filters */}
                <div className="overflow-x-auto whitespace-nowrap -mx-2 px-2 py-1">
                  <div className="inline-flex gap-2">
                    {dateFilterOptions.map(option => (
                      <button
                        key={option.value}
                        className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                          dateRange === option.value
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setDateRange(option.value)}
                      >
                        <span className="mr-1.5">{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Sort Controls */}
                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={toggleSortDirection}
                    className="inline-flex items-center p-1.5 border border-gray-300 rounded-md hover:bg-gray-100"
                    aria-label={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'}
                  >
                    {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Orders Timeline View */}
            {error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
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
                <FaHistory className="mx-auto text-gray-300 text-5xl mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Order History Found</h2>
                <p className="text-gray-600 mb-6 px-4">
                  {orders.length === 0
                    ? "You haven't placed any orders yet."
                    : "No orders match your current filters."
                  }
                </p>
                {orders.length === 0 ? (
                  <Link 
                    to="/products"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Start Shopping
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setDateRange('all');
                    }}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FaFilter className="mr-2" /> Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedOrders).map(([monthYear, monthOrders]) => (
                  <div key={monthYear}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      {monthYear} ({monthOrders.length} order{monthOrders.length > 1 ? 's' : ''})
                    </h3>
                    
                    <div className="relative pl-8 border-l-2 border-purple-200">
                      {monthOrders.map((order, index) => (
                        <div 
                          key={order.id || order.order_number}
                          className={`relative mb-6 ${index === monthOrders.length - 1 ? '' : ''}`}
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-10 mt-1.5">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              order.status === 'completed' ? 'bg-green-100 border-green-500' :
                              order.status === 'cancelled' ? 'bg-red-100 border-red-500' :
                              'bg-purple-100 border-purple-500'
                            }`}></div>
                          </div>
                          
                          {/* Order card */}
                          <div className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow p-4 border border-gray-100">
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
                                    {formatDate(order.created_at)} ({formatTimeAgo(order.created_at)})
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
                                  KSh {formatCurrency(order.total)}
                                </div>
                                <button
                                  onClick={() => navigate(`/orders/${order.id}`)}
                                  className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center"
                                >
                                  <FaEye className="mr-2" /> View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Export Options */}
                <div className="flex justify-end mt-8 gap-3">
                  <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    <FaFilePdf className="mr-2" /> Export PDF
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    <FaDownload className="mr-2" /> Download CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Information Modal */}
      {isInfoModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setIsInfoModalOpen(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 pointer-events-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Order History Information</h3>
                  <button 
                    onClick={() => setIsInfoModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimesCircle />
                  </button>
                </div>
                <div className="text-gray-600">
                  <p className="mb-3">Your order history shows all your past purchases in chronological order. Key information:</p>
                  <ul className="list-disc pl-5 space-y-2 mb-3">
                    <li>View detailed statistics about your ordering patterns</li>
                    <li>Filter orders by date ranges</li>
                    <li>Search for specific orders</li>
                    <li>Sort by date, amount, or status</li>
                    <li>Access detailed order information</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-4">Need help with your orders? Contact our support team.</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsInfoModalOpen(false)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderHistory;