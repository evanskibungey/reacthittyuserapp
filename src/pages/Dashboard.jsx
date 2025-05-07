import React, { useState, useEffect } from 'react';
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
  FaExchangeAlt,
  FaRegClock,
  FaRegCalendarAlt,
  FaCheckCircle,
  FaTruck,
  FaClipboardList,
  FaArrowRight,
  FaFireAlt
} from 'react-icons/fa';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch customer profile and recent orders
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get customer profile
        const profileResponse = await profileService.getProfile();
        console.log('Profile response:', profileResponse);
        
        if (profileResponse.success) {
          setProfile(profileResponse.data);
          
          // Get recent orders
          try {
            const ordersResponse = await orderService.getOrders();
            console.log('Orders response:', ordersResponse);
            
            if (ordersResponse.success) {
              // Take only the first 5 orders if there are more
              const orders = ordersResponse.orders || [];
              setRecentOrders(orders.slice(0, 5));
            }
          } catch (orderError) {
            console.error('Error fetching orders:', orderError);
            // We'll still show the dashboard even if orders fail to load
          }
        } else {
          setError(profileResponse.message || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  // Format today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generic component for stat cards
  const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-white rounded-lg shadow-sm p-5 flex items-center border-l-4 border-${color}`}>
      <div className={`text-${color} text-3xl mr-4`}>
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-gray-800 text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

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
          {profile && (
            <>
              {/* Welcome Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Welcome back, {profile.name}!
                  </h1>
                  <span className="text-sm text-gray-500">{formattedDate}</span>
                </div>
                <p className="text-gray-600">Manage your orders, profile, and rewards from here.</p>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                  icon={<FaShoppingBag />}
                  title="Total Orders"
                  value={profile.order_count || 0}
                  color="purple-500"
                />
                <StatCard 
                  icon={<FaGift />}
                  title="Hitty Points"
                  value={profile.hitty_points || 0}
                  color="green-500"
                />
                <StatCard 
                  icon={<FaExchangeAlt />}
                  title="Points Value"
                  value={`₦${profile.hitty_points || 0}`}
                  color="blue-500"
                />
              </div>
              
              {/* Orders & Profile Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FaBox className="mr-2 text-purple-600" />
                        Recent Orders
                      </h2>
                      <Link to="/orders" className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center">
                        View All <FaArrowRight className="ml-1" size={12} />
                      </Link>
                    </div>
                    
                    <div className="p-6">
                      {recentOrders && recentOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <th className="px-4 py-3">Order #</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {recentOrders.map((order) => (
                                <tr key={order.id || order.order_number} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-800">
                                    #{order.id || order.order_number}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-gray-600 flex items-center">
                                    <FaRegCalendarAlt className="mr-2 text-gray-400" size={14} />
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-800">
                                    ₦{order.total}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <StatusBadge status={order.status} />
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <button 
                                      onClick={() => navigate(`/orders/${order.id}`)}
                                      className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                                    >
                                      View Details
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FaBox className="mx-auto text-gray-300 text-4xl mb-4" />
                          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                          <Link 
                            to="/products"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                          >
                            Browse Products
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Profile & Referral Section */}
                <div className="space-y-8">
                  {/* Profile Card */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FaUser className="mr-2 text-purple-600" />
                        My Profile
                      </h2>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex flex-col mb-6">
                        <div className="text-center mb-4">
                          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-purple-100 text-purple-700 text-xl mb-3">
                            {profile.name.charAt(0).toUpperCase()}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">{profile.name}</h3>
                          {profile.is_phone_verified && (
                            <span className="inline-flex items-center text-xs text-green-800 bg-green-100 px-2 py-1 rounded-full">
                              <FaCheckCircle className="mr-1" size={10} /> Verified
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-600">
                            <FaPhone className="mr-3 text-gray-400" />
                            <span>{profile.phone}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaEnvelope className="mr-3 text-gray-400" />
                            <span>{profile.email || 'No email provided'}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaMapMarkerAlt className="mr-3 text-gray-400" />
                            <span>{profile.location || 'No location provided'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Link 
                        to="/profile"
                        className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-center text-gray-700 font-medium rounded-md transition-colors"
                      >
                        Edit Profile
                      </Link>
                    </div>
                  </div>
                  
                  {/* Referral Card */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FaGift className="mr-2 text-purple-600" />
                        Referral Bonus
                      </h2>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="mb-3 flex items-center text-gray-700">
                          <FaFireAlt className="mr-2 text-orange-500" />
                          <span className="font-medium">Earn points by referring friends</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                          Share your referral code with friends and both of you will get 10 Hitty Points when they place their first order!
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200 mb-4">
                        <span className="font-mono text-base text-gray-800 font-medium">
                          {profile.referral_code || 'No referral code yet'}
                        </span>
                        {profile.referral_code && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(profile.referral_code);
                              alert('Referral code copied to clipboard!');
                            }}
                            className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors"
                          >
                            Copy
                          </button>
                        )}
                      </div>
                      
                      <Link 
                        to="/referrals"
                        className="block w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 text-center font-medium rounded-md transition-colors"
                      >
                        View Referral History
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// Component for order status badges
const StatusBadge = ({ status }) => {
  let color = '';
  let icon = null;
  
  switch(status?.toLowerCase()) {
    case 'delivered':
      color = 'bg-green-100 text-green-800';
      icon = <FaCheckCircle />;
      break;
    case 'processing':
      color = 'bg-blue-100 text-blue-800';
      icon = <FaRegClock />;
      break;
    case 'shipped':
      color = 'bg-indigo-100 text-indigo-800';
      icon = <FaTruck />;
      break;
    case 'cancelled':
      color = 'bg-red-100 text-red-800';
      icon = <FaClipboardList />;
      break;
    default:
      color = 'bg-yellow-100 text-yellow-800';
      icon = <FaRegClock />;
  }
  
  return (
    <span className={`px-3 py-1.5 inline-flex items-center text-xs font-medium rounded-full ${color}`}>
      <span className="mr-1">{icon}</span>
      {status || 'Pending'}
    </span>
  );
};

export default Dashboard;
