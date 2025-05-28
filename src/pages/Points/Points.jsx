import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { profileService } from '../../services/api'
import toast from 'react-hot-toast'
import { FaGift, FaUsers, FaCrown, FaHistory, FaShoppingCart, FaRegCopy, FaCheckCircle, FaInfoCircle, FaArrowRight, FaCoins, FaCopy, FaCheck, FaExternalLinkAlt, FaStar, FaTrophy, FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import { openWhatsApp, getReferralMessage } from '../../utils/whatsappUtils'

const Points = () => {
  const [profile, setProfile] = useState(null)
  const [pointsData, setPointsData] = useState(null)
  const [pointsHistory, setPointsHistory] = useState([])
  const [referralData, setReferralData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState(null)
  const [codeCopied, setCodeCopied] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Fetch profile data
      const profileResponse = await profileService.getProfile()
      if (profileResponse.success) {
        setProfile(profileResponse.data)
      }
      
      // Fetch points data
      const pointsResponse = await profileService.getPoints()
      if (pointsResponse.success) {
        setPointsData(pointsResponse.data)
      }
      
      // Fetch referral info
      const referralResponse = await profileService.getReferralInfo()
      if (referralResponse.success) {
        setReferralData(referralResponse.data)
      }
      
      // Fetch points history
      fetchPointsHistory()
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchPointsHistory = async () => {
    try {
      setHistoryLoading(true)
      const historyResponse = await profileService.getPointsHistory(20)
      if (historyResponse.success) {
        setPointsHistory(historyResponse.data.history || [])
      }
    } catch (error) {
      console.error('Error fetching points history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const copyReferralCode = () => {
    const referralCode = referralData?.referral_code || profile?.referral_code
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      setCodeCopied(true)
      toast.success('Referral code copied to clipboard!')
      
      setTimeout(() => {
        setCodeCopied(false)
      }, 3000)
    }
  }

  const shareReferralCode = (platform) => {
    const referralCode = referralData?.referral_code || profile?.referral_code
    
    switch (platform) {
      case 'whatsapp':
        // Use the WhatsApp utility function for referral sharing
        openWhatsApp(undefined, getReferralMessage(referralCode))
        break
      case 'facebook':
        const message = `Join Hitty Deliveries and get 10 points (worth KSh 10) on your first order! Use my referral code: ${referralCode}`
        const encodedMessage = encodeURIComponent(message)
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodedMessage}`, '_blank')
        break
      case 'twitter':
        const twitterMessage = `Join Hitty Deliveries and get 10 points (worth KSh 10) on your first order! Use my referral code: ${referralCode}`
        const encodedTwitterMessage = encodeURIComponent(twitterMessage)
        window.open(`https://twitter.com/intent/tweet?text=${encodedTwitterMessage}`, '_blank')
        break
      default:
        break
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type, sourceType) => {
    if (type === 'credit') {
      if (sourceType === 'order' || sourceType === 'purchase') return <FaShoppingCart className="text-green-600" />
      if (sourceType === 'referral') return <FaUsers className="text-blue-600" />
      return <FaGift className="text-purple-600" />
    }
    return <FaArrowRight className="text-red-600 transform rotate-180" />
  }

  if (loading) {
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
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const currentPoints = pointsData?.hitty_points || profile?.hitty_points || 0
  const kesValue = pointsData?.kes_value || currentPoints
  const totalReferrals = referralData?.referral_stats?.total_referrals || 0
  const successfulReferrals = referralData?.referral_stats?.successful_referrals || 0
  const pendingReferrals = referralData?.referral_stats?.pending_referrals || 0
  const referralPointsEarned = referralData?.referral_stats?.total_points_earned || 0

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
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <button onClick={() => navigate('/dashboard')} className="hover:text-purple-700">Dashboard</button>
            <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium text-gray-900">Points & Referrals</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Points & Referrals</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {/* Points Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Points */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Available Points</p>
                  <p className="text-3xl font-bold text-gray-800">{currentPoints}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FaGift className="text-purple-600" size={24} />
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Cash Value</span>
                  <span className="font-semibold text-purple-700">KSh {kesValue}</span>
                </div>
              </div>
            </div>
            
            {/* Total Referrals */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Referrals</p>
                  <p className="text-3xl font-bold text-gray-800">{totalReferrals}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaUsers className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Successful</span>
                  <span className="font-semibold text-green-600">{successfulReferrals}</span>
                </div>
              </div>
            </div>
            
            {/* Points from Referrals */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Referral Points</p>
                  <p className="text-3xl font-bold text-gray-800">{referralPointsEarned}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FaCrown className="text-green-600" size={24} />
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Pending</span>
                  <span className="font-semibold text-orange-600">{pendingReferrals}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Referral Program */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaUsers className="mr-2 text-purple-600" />
                Referral Program
              </h2>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Your Referral Code</h3>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200">
                  <span className="font-mono text-lg text-gray-800 font-medium">
                    {referralData?.referral_code || profile?.referral_code || 'Loading...'}
                  </span>
                  <button
                    onClick={copyReferralCode}
                    className={`p-2 ${codeCopied ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'} rounded-lg hover:bg-opacity-80 transition-colors`}
                  >
                    {codeCopied ? <FaCheckCircle size={18} /> : <FaRegCopy size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Share Your Code</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => shareReferralCode('whatsapp')}
                    className="bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => shareReferralCode('facebook')}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => shareReferralCode('twitter')}
                    className="bg-sky-100 hover:bg-sky-200 text-sky-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Twitter
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">How It Works</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-3 flex-shrink-0">1</span>
                    <p>Share your referral code with friends</p>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-3 flex-shrink-0">2</span>
                    <p>They sign up using your code</p>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center font-medium mr-3 flex-shrink-0">3</span>
                    <p>When they place their first order, both of you get 10 points (worth KSh 10)!</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* How to Earn Points */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaInfoCircle className="mr-2 text-purple-600" />
                How to Earn Points
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-800 mb-1">Place Orders</h3>
                  <p className="text-sm text-gray-600">Earn 10 points (worth KSh 10) for every order you complete</p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-800 mb-1">Refer Friends</h3>
                  <p className="text-sm text-gray-600">Get 10 points (worth KSh 10) when your referral places their first order</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-800 mb-1">Sign Up Bonus</h3>
                  <p className="text-sm text-gray-600">New users get 10 points (worth KSh 10) when signing up with a referral code</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2 flex items-center">
                  <FaGift className="mr-2" />
                  Redeem Your Points
                </h3>
                <p className="text-sm text-purple-700 mb-3">
                  Use your points to get discounts on your orders. Every 10 points = KSh 10
                </p>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Minimum 100 points required to redeem (worth KSh 100)</li>
                  <li>• Points can be used during checkout</li>
                  <li>• Points never expire</li>
                  <li>• 10 points = KSh 10 discount value</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Points History */}
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaHistory className="mr-2 text-purple-600" />
                Points History
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              {historyLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading history...</p>
                </div>
              ) : pointsHistory.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pointsHistory.map((transaction, index) => (
                      <tr key={transaction.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="mr-2">{getTransactionIcon(transaction.type, transaction.source_type)}</span>
                            {transaction.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.type === 'credit' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{Math.abs(transaction.points)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                          {transaction.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <FaHistory className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">No points history yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start earning points by placing orders!</p>
                  <button
                    onClick={() => navigate('/products')}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Browse Products
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Points
