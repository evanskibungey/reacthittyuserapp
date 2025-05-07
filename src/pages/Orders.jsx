import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaExclamationTriangle
} from 'react-icons/fa';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await orderService.getOrders();
        console.log('Orders response:', response);
        
        if (response.success) {
          const ordersData = response.orders || [];
          setOrders(ordersData);
          setFilteredOrders(ordersData);
        } else {
          setError(response.message || 'Failed to load orders');
        }
      } catch (err) {
        console.error('Orders fetch error:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search term and status filter
  useEffect(() => {
    let result = orders;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(order => 
        String(order.id || order.order_number).includes(searchTerm) ||
        String(order.total).includes(searchTerm)
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => 
        order.status?.toLowerCase() === statusFilter
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

  const getStatusBadge = (status) => {
    let color = '';
    let icon = null;
    
    switch(status?.toLowerCase()) {
      case 'delivered':
        color = 'bg-green-100 text-green-800';
        icon = <FaCheckCircle size={14} />;
        break;
      case 'processing':
        color = 'bg-blue-100 text-blue-800';
        icon = <FaRegClock size={14} />;
        break;
      case 'shipped':
        color = 'bg-indigo-100 text-indigo-800';
        icon = <FaTruck size={14} />;
        break;
      case 'cancelled':
        color = 'bg-red-100 text-red-800';
        icon = <FaClipboardList size={14} />;
        break;
      default:
        color = 'bg-yellow-100 text-yellow-800';
        icon = <FaRegClock size={14} />;
    }
    
    return (
      <span className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full ${color}`}>
        <span className="mr-1">{icon}</span>
        <span>{status || 'Pending'}</span>
      </span>
    );
  };

  const filterButtons = [
    { label: 'All', value: 'all' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">My Orders</h1>
            <p className="text-gray-600">View and track all your orders in one place.</p>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {filterButtons.map(button => (
                  <button
                    key={button.value}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      statusFilter === button.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setStatusFilter(button.value)}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Orders List */}
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <div className="flex items-center">
                <FaExclamationTriangle className="mr-2" />
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
              <button
                className="mt-4 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-2 px-4 rounded"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <FaBox className="mx-auto text-gray-300 text-5xl mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
              <p className="text-gray-600 mb-6">
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
                  Browse Products
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
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
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
                    {filteredOrders.map((order) => (
                      <tr key={order.id || order.order_number} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-purple-100 rounded-md">
                              <FaBox className="text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                #{order.id || order.order_number}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.items?.length || 0} Items
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₦{order.total}</div>
                          <div className="text-sm text-gray-500">
                            {order.payment_method || 'Cash on Delivery'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="text-purple-600 hover:text-purple-800 font-medium mr-3"
                          >
                            View Details
                          </button>
                          {order.status?.toLowerCase() === 'shipped' && (
                            <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                              Track
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;