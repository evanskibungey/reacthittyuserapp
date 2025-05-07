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
  FaRegClock
} from 'react-icons/fa';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await orderService.getOrder(id);
        console.log('Order details response:', response);
        if (response.success) {
          setOrder(response.order);
        } else {
          setError(response.message || 'Failed to load order details');
        }
      } catch (err) {
        setError('Error fetching order details. Please try again.');
        console.error('Order fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'processing':
        return <FaClock className="text-blue-500" />;
      case 'shipped':
        return <FaTruck className="text-indigo-500" />;
      case 'cancelled':
        return <FaTimes className="text-red-500" />;
      default:
        return <FaRegClock className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
                    Order #{order.id || order.order_number}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-400" />
                      Placed on: {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </span>
                  </div>
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
                      <span className="text-gray-800 font-medium">₦{order.subtotal}</span>
                    </div>
                    
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₦{order.discount}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-800 font-medium">Free</span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex justify-between">
                      <span className="text-gray-800 font-bold">Total:</span>
                      <span className="text-gray-800 font-bold">₦{order.total}</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Information */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Payment Information</h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <FaCreditCard className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Payment Method</p>
                        <p className="text-gray-800 font-medium">{order.payment_method || 'Cash on Delivery'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <FaCheckCircle className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-gray-600">Payment Status</p>
                        <p className="text-green-600 font-medium">Paid</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Information */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Shipping Information</h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start mb-4">
                      <FaMapMarkerAlt className="mr-3 mt-1 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Delivery Address</p>
                        <p className="text-gray-800 font-medium">{order.delivery_address || 'No address provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaTruck className="mr-3 mt-1 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Shipping Status</p>
                        <p className="text-gray-800 font-medium">Estimated Delivery: 3-5 business days</p>
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
                          <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                            ₦{item.unit_price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                            ₦{item.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors font-medium">
                  Need Help?
                </button>
                <button className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium">
                  Track Order
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