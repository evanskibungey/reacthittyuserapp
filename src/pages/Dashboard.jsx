import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { profileService, orderService, authService } from '../services/api';
import { 
  FaUser, 
  FaBox, 
  FaGift, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaShoppingBag,
  FaCoins,
  FaRegClock,
  FaRegCalendarAlt,
  FaCheckCircle,
  FaTruck,
  FaArrowRight,
  FaFireAlt,
  FaSyncAlt,
  FaHistory,
  FaMoneyBillAlt,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// Lazy load components that aren't needed immediately
const ProfileSummary = lazy(() => import('../components/dashboard/ProfileSummary'));
const PointsSummary = lazy(() => import('../components/dashboard/PointsSummary'));

const Dashboard = () => {
  // State management
  const [profile, setProfile] = useState(null);
  const [pointsData, setPointsData] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [partialLoading, setPartialLoading] = useState({
    profile: true,
    points: true,
    orders: true
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const navigate = useNavigate();

  // Fetch profile data
  const fetchProfileData = async () => {
    setPartialLoading(prev => ({ ...prev, profile: true }));
    try {
      const profileResponse = await profileService.getProfile();
      
      if (profileResponse.success) {
        setProfile(profileResponse.data);
        
        // Initialize order count from profile if available
        if (profileResponse.data && profileResponse.data.order_count) {
          setTotalOrdersCount(profileResponse.data.order_count);
        }
      } else {
        console.error('Failed to load profile:', profileResponse.message);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setPartialLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Fetch points data
  const fetchPointsData = async () => {
    setPartialLoading(prev => ({ ...prev, points: true }));
    try {
      // Get points data
      const pointsResponse = await profileService.getPoints();
      if (pointsResponse.success) {
        setPointsData(pointsResponse.data);
      }
      
      // Get points history
      const historyResponse = await profileService.getPointsHistory();
      if (historyResponse.success) {
        setPointsHistory(historyResponse.data?.history || []);
      }
    } catch (err) {
      console.error('Points data fetch error:', err);
    } finally {
      setPartialLoading(prev => ({ ...prev, points: false }));
    }
  };

  // Fetch orders data
  const fetchOrdersData = async () => {
    setPartialLoading(prev => ({ ...prev, orders: true }));
    try {
      // First fetch recent orders for display
      const recentOrdersResponse = await orderService.getOrders({
        per_page: 5,
        sort_by: 'created_at',
        sort_dir: 'desc'
      });
      
      if (recentOrdersResponse.success) {
        setRecentOrders(recentOrdersResponse.orders || []);
        
        // Check if the meta data contains the total count
        if (recentOrdersResponse.meta && recentOrdersResponse.meta.total) {
          setTotalOrdersCount(recentOrdersResponse.meta.total);
        } else {
          // If we don't have meta.total, fetch all orders to count them
          // Note: This is an efficient approach if the API supports pagination and returns total count
          try {
            const allOrdersResponse = await orderService.getOrders({
              per_page: 100,  // Get a large number of orders to make counting more accurate
              sort_by: 'created_at',
              sort_dir: 'desc'
            });
            
            if (allOrdersResponse.success) {
              // Use the length of the orders array or the meta.total if available
              const count = allOrdersResponse.meta?.total || allOrdersResponse.orders?.length || 0;
              setTotalOrdersCount(count);
            }
          } catch (countErr) {
            console.error('Error counting all orders:', countErr);
            // Fall back to the count of recent orders if we can't get the total
            setTotalOrdersCount(recentOrdersResponse.orders?.length || 0);
          }
        }
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
    } finally {
      setPartialLoading(prev => ({ ...prev, orders: false }));
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setRefreshing(true);
    
    try {
      // Fetch data in parallel for faster loading
      await Promise.all([
        fetchProfileData(),
        fetchPointsData(),
        fetchOrdersData()
      ]);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchDashboardData();
    
    // Clear console logs in production
    if (process.env.NODE_ENV === 'production') {
      console.clear();
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  // Memoize the formatted date to prevent recalculation
  const formattedDate = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Format date for history items
  const formatHistoryDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading && !profile) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header 
          setIsAuthModalOpen={setIsAuthModalOpen} 
          setIsCartOpen={setIsCartOpen} 
          isLoggedIn={true} 
          setIsLoggedIn={() => {}}
        />
        <div className="flex flex-1">
          <Sidebar onLogout={handleLogout} />
          <div className="flex-1 ml-64 pt-16">
            <div className="flex justify-center items-center h-screen">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-3"></div>
                <p className="text-purple-700 font-medium">Loading your dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header 
          setIsAuthModalOpen={setIsAuthModalOpen} 
          setIsCartOpen={setIsCartOpen} 
          isLoggedIn={true} 
          setIsLoggedIn={() => {}}
        />
        <div className="flex flex-1">
          <Sidebar onLogout={handleLogout} />
          <div className="flex-1 ml-64 pt-16">
            <div className="flex justify-center items-center h-screen">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
                <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
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
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar onLogout={handleLogout} />
        
        {/* Main Content */}
        <div className="flex-1 ml-64 pt-16 px-4 sm:px-6 lg:px-8 pb-8 overflow-y-auto">
          {profile && (
            <>
              {/* Welcome Section */}
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
                <div className="md:flex justify-between items-center">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                      Welcome back, {profile.name}!
                    </h1>
                    <p className="text-gray-600 mb-4 md:mb-0">
                      {formattedDate}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={fetchDashboardData}
                      disabled={refreshing}
                      className={`flex items-center justify-center px-4 py-2 mr-4 text-sm border border-gray-300 rounded-lg ${
                        refreshing ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      aria-label="Refresh dashboard data"
                    >
                      <FaSyncAlt className={`mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                      {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <Link
                      to="/profile"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                      aria-label="Go to profile page"
                    >
                      <FaUser className="mr-1.5" />
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                {/* Card 1 - Total Orders */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-sm p-4 md:p-6 overflow-hidden relative border border-indigo-100">
                  <div className="absolute right-0 top-0 w-20 h-20 opacity-10 transform translate-x-6 -translate-y-6">
                    <FaShoppingBag className="w-full h-full text-indigo-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="bg-indigo-600 bg-opacity-20 p-2 rounded-lg mr-3">
                        <FaShoppingBag className="text-indigo-600" />
                      </div>
                      <h3 className="text-sm font-medium text-indigo-900">Total Orders</h3>
                    </div>
                    {partialLoading.orders ? (
                      <div className="h-8 w-20 bg-indigo-200 animate-pulse rounded mb-2"></div>
                    ) : (
                      <p className="text-2xl md:text-3xl font-bold text-indigo-900 mb-1">
                        {totalOrdersCount || profile?.order_count || 0}
                      </p>
                    )}
                    <div className="flex items-center text-indigo-800 text-sm">
                      <Link to="/orders" className="flex items-center hover:underline">
                        View order history
                        <FaArrowRight className="ml-1 text-xs" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Hitty Points */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-4 md:p-6 overflow-hidden relative border border-green-100">
                  <div className="absolute right-0 top-0 w-20 h-20 opacity-10 transform translate-x-6 -translate-y-6">
                    <FaCoins className="w-full h-full text-green-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="bg-green-600 bg-opacity-20 p-2 rounded-lg mr-3">
                        <FaCoins className="text-green-600" />
                      </div>
                      <h3 className="text-sm font-medium text-green-900">Hitty Points</h3>
                    </div>
                    {partialLoading.points ? (
                      <div className="h-8 w-20 bg-green-200 animate-pulse rounded mb-2"></div>
                    ) : (
                      <p className="text-2xl md:text-3xl font-bold text-green-900 mb-1">
                        {pointsData?.hitty_points || profile.hitty_points || 0}
                      </p>
                    )}
                    <div className="flex items-center text-green-800 text-sm">
                      <span>Available for redemption</span>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Points Value */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-sm p-4 md:p-6 overflow-hidden relative border border-amber-100 sm:col-span-2 lg:col-span-1">
                  <div className="absolute right-0 top-0 w-20 h-20 opacity-10 transform translate-x-6 -translate-y-6">
                    <FaMoneyBillAlt className="w-full h-full text-amber-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="bg-amber-600 bg-opacity-20 p-2 rounded-lg mr-3">
                        <FaMoneyBillAlt className="text-amber-600" />
                      </div>
                      <h3 className="text-sm font-medium text-amber-900">Points Value</h3>
                    </div>
                    {partialLoading.points ? (
                      <div className="h-8 w-28 bg-amber-200 animate-pulse rounded mb-2"></div>
                    ) : (
                      <p className="text-2xl md:text-3xl font-bold text-amber-900 mb-1">
                        KSh {pointsData?.kes_value || (pointsData?.hitty_points || profile.hitty_points || 0)}
                      </p>
                    )}
                    <div className="flex items-center text-amber-800 text-sm">
                      <span>1 point = KSh 1</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Points Summary Card */}
              <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden border border-gray-100">
                <div className="flex flex-col lg:flex-row">
                  <div className="p-4 md:p-6 lg:w-1/3 lg:border-r border-gray-100">
                    <div className="flex items-center mb-4">
                      <FaGift className="text-purple-600 mr-2" size={20} />
                      <h2 className="text-lg font-semibold text-gray-800">Points Summary</h2>
                    </div>

                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <FaCoins className="text-purple-600" size={16} />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Current Balance</div>
                            {partialLoading.points ? (
                              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                            ) : (
                              <div className="text-xl font-bold text-gray-800">
                                {pointsData?.hitty_points || profile.hitty_points || 0} points
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Earned this month</span>
                            {partialLoading.points ? (
                              <div className="h-5 w-12 bg-gray-200 animate-pulse rounded"></div>
                            ) : (
                              <span className="font-medium text-gray-800">
                                {pointsHistory && pointsHistory.length > 0 
                                  ? pointsHistory
                                      .filter(transaction => {
                                        const date = new Date(transaction.created_at);
                                        const now = new Date();
                                        return date.getMonth() === now.getMonth() && 
                                               date.getFullYear() === now.getFullYear() &&
                                               parseInt(transaction.points) > 0;
                                      })
                                      .reduce((sum, transaction) => sum + parseInt(transaction.points), 0)
                                  : 0}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Used this month</span>
                            {partialLoading.points ? (
                              <div className="h-5 w-12 bg-gray-200 animate-pulse rounded"></div>
                            ) : (
                              <span className="font-medium text-gray-800">
                                {pointsHistory && pointsHistory.length > 0 
                                  ? pointsHistory
                                      .filter(transaction => {
                                        const date = new Date(transaction.created_at);
                                        const now = new Date();
                                        return date.getMonth() === now.getMonth() && 
                                               date.getFullYear() === now.getFullYear() &&
                                               parseInt(transaction.points) < 0;
                                      })
                                      .reduce((sum, transaction) => sum + Math.abs(parseInt(transaction.points)), 0)
                                  : 0}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {profile.referral_code && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center text-sm font-medium text-purple-800 mb-2">
                            <FaFireAlt className="mr-1.5 text-purple-600" size={12} />
                            Your Referral Code
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-purple-900">{profile.referral_code}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(profile.referral_code);
                                alert('Referral code copied!');
                              }}
                              className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 md:p-6 lg:w-2/3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FaHistory className="text-purple-600 mr-2" size={18} />
                        <h3 className="text-lg font-semibold text-gray-800">Recent Points Activity</h3>
                      </div>
                    </div>

                    {partialLoading.points ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg animate-pulse">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                              <div>
                                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                            <div className="h-5 w-16 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : pointsHistory && pointsHistory.length > 0 ? (
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Points</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {pointsHistory.slice(0, 5).map((transaction, index) => (
                              <tr key={transaction.id || index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {formatHistoryDate(transaction.created_at)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-800">
                                  {transaction.description}
                                </td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${parseInt(transaction.points) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {parseInt(transaction.points) >= 0 ? '+' : ''}{transaction.points}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <FaGift className="mx-auto text-gray-300 text-4xl mb-3" />
                        <p className="text-gray-500 mb-1">No points activity yet</p>
                        <p className="text-sm text-gray-400">
                          Points are earned with every purchase and when friends use your referral code
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Orders & Profile Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                    <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center">
                        <FaBox className="text-purple-600 mr-2" size={18} />
                        <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                      </div>
                      <Link to="/orders" className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center">
                        View All <FaArrowRight className="ml-1" size={12} />
                      </Link>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {partialLoading.orders ? (
                        // Loading skeleton for orders
                        [...Array(3)].map((_, index) => (
                          <div key={index} className="p-4 md:p-5">
                            <div className="flex justify-between items-start mb-2">
                              <div className="w-1/2">
                                <div className="h-5 w-32 bg-gray-200 animate-pulse rounded mb-2"></div>
                                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                              </div>
                              <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                            </div>
                          </div>
                        ))
                      ) : recentOrders && recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                          <div key={order.id || order.order_number} className="p-4 md:p-5 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {order.order_number ? 
                                    `Order #${order.order_number}` : 
                                    `Order ID: ${order.id || 'N/A'}`
                                  }
                                </div>
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <FaRegCalendarAlt className="mr-1 text-gray-400" size={12} />
                                  {order.created_at ? 
                                    new Date(order.created_at).toLocaleDateString() : 
                                    'Date unavailable'
                                  }
                                </div>
                              </div>
                              <StatusBadge status={order.status} />
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="font-semibold text-gray-800">
                                KSh {order.total ? parseFloat(order.total).toLocaleString() : '0'}
                              </div>
                              {order.id && (
                                <button 
                                  onClick={() => navigate(`/orders/${order.id}`)}
                                  className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
                                >
                                  View Details
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <FaBox className="text-gray-400" size={24} />
                          </div>
                          <h3 className="text-lg font-medium text-gray-800 mb-2">No orders yet</h3>
                          <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                            You haven't placed any orders yet. Start shopping to see your orders here.
                          </p>
                          <Link 
                            to="/products"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none transition-colors"
                          >
                            Browse Products
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Profile Summary */}
                <div>
                  <Suspense fallback={
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 p-6">
                      <div className="flex justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                      </div>
                    </div>
                  }>
                    <ProfileSummary profile={profile} isLoading={partialLoading.profile} />
                  </Suspense>
                  
                  {/* Referral Promo Card */}
                  {profile && profile.referral_code && (
                    <div className="mt-6 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg shadow-md overflow-hidden text-white relative">
                      <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-purple-400 rounded-full opacity-20"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 bg-indigo-400 rounded-full opacity-20"></div>
                      
                      <div className="p-6 relative z-10">
                        <FaGift className="text-white text-2xl md:text-3xl mb-3" />
                        <h3 className="text-lg font-bold mb-2">Refer & Earn!</h3>
                        <p className="text-purple-100 mb-4 text-sm">
                          Share your code <span className="font-mono font-bold">{profile.referral_code}</span> with friends and earn points when they make their first purchase.
                        </p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(profile.referral_code);
                            alert('Referral code copied!');
                          }}
                          className="bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Copy Referral Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Component for order status badges
const StatusBadge = ({ status }) => {
  // Set default status if none provided
  const orderStatus = status || 'pending';
  
  let bgColor = '';
  let textColor = '';
  let icon = null;
  
  switch(orderStatus.toLowerCase()) {
    case 'delivered':
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <FaCheckCircle size={12} />;
      break;
    case 'processing':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = <FaRegClock size={12} />;
      break;
    case 'shipped':
    case 'in_transit':
      bgColor = 'bg-indigo-100';
      textColor = 'text-indigo-800';
      icon = <FaTruck size={12} />;
      break;
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = <FaTimes size={12} />;
      break;
    default:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = <FaRegClock size={12} />;
  }
  
  // Transform status to readable format (e.g., "in_transit" -> "In Transit")
  const formatStatus = (status) => {
    if (!status) return 'Pending';
    
    if (status === 'in_transit') return 'In Transit';
    
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <span className="mr-1">{icon}</span>
      {formatStatus(orderStatus)}
    </span>
  );
};

export default Dashboard;