import React, { useState, useEffect } from 'react'
import { profileService } from '../services/api'
import toast from 'react-hot-toast'
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaGift, FaShoppingBag, FaKey, FaLock, FaRegCopy, FaCheckCircle } from 'react-icons/fa'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [pointsData, setPointsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    password: '',
    password_confirmation: '',
  })

  // Password field visibility toggle
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        
        // Get profile data
        const profileResponse = await profileService.getProfile()
        console.log('Profile response:', profileResponse)
        
        if (profileResponse.success) {
          setProfile(profileResponse.data)
          
          // Initialize form with profile data
          setFormData({
            name: profileResponse.data.name || '',
            email: profileResponse.data.email || '',
            location: profileResponse.data.location || '',
            password: '',
            password_confirmation: '',
          })
          
          // Get points data
          try {
            const pointsResponse = await profileService.getPoints()
            console.log('Points response:', pointsResponse)
            if (pointsResponse.success) {
              setPointsData(pointsResponse.data)
            }
          } catch (pointsError) {
            console.error('Error fetching points:', pointsError)
          }
        } else {
          setError(profileResponse.message || 'Failed to load profile data')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('Failed to load profile data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (updating) return
    
    // Clear previous messages
    setError(null)
    setSuccessMessage('')
    
    // Validate password fields if entered
    if (formData.password && formData.password !== formData.password_confirmation) {
      setError('Passwords do not match')
      return
    }
    
    try {
      setUpdating(true)
      
      // Prepare update data - only include fields that have values
      const updateData = {
        name: formData.name,
      }
      
      if (formData.email) {
        updateData.email = formData.email
      }
      
      if (formData.location) {
        updateData.location = formData.location
      }
      
      if (formData.password) {
        updateData.password = formData.password
        updateData.password_confirmation = formData.password_confirmation
      }
      
      const response = await profileService.updateProfile(updateData)
      
      if (response.success) {
        // Update local profile state
        setProfile(prev => ({
          ...prev,
          name: formData.name,
          email: formData.email || prev.email,
          location: formData.location || prev.location,
        }))
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          password: '',
          password_confirmation: '',
        }))
        
        setSuccessMessage('Profile updated successfully!')
        toast.success('Profile updated successfully!')
      } else {
        setError(response.message || 'Failed to update profile')
        toast.error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Network error. Please try again later.')
      toast.error('Network error. Please try again later.')
    } finally {
      setUpdating(false)
    }
  }

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code)
      setCodeCopied(true)
      toast.success('Referral code copied to clipboard!')
      
      // Reset copied state after 3 seconds
      setTimeout(() => {
        setCodeCopied(false)
      }, 3000)
    }
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
            <span className="font-medium text-gray-900">My Profile</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {successMessage}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-purple-100 text-purple-700 text-2xl mb-4">
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">{profile?.name}</h2>
                  <div className="flex items-center justify-center mt-1">
                    {profile?.is_phone_verified && (
                      <span className="inline-flex items-center text-xs text-green-800 bg-green-100 px-2 py-1 rounded-full mr-2">
                        <FaCheckCircle className="mr-1" size={10} /> Verified Phone
                      </span>
                    )}
                    {profile?.is_email_verified && profile?.email && (
                      <span className="inline-flex items-center text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded-full">
                        <FaCheckCircle className="mr-1" size={10} /> Verified Email
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                      <FaPhone className="text-gray-500" size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                      <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                      <FaEnvelope className="text-gray-500" size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email Address</p>
                      <p className="font-medium">{profile?.email || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                      <FaMapMarkerAlt className="text-gray-500" size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
                      <p className="font-medium">{profile?.location || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Points Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaGift className="mr-2 text-purple-600" />
                  Hitty Points
                </h3>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-800">
                      {pointsData?.hitty_points || profile?.hitty_points || 0}
                    </p>
                    <p className="text-sm text-gray-500">Available Points</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaGift className="text-purple-600" size={24} />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">Points Value</p>
                      <p className="text-sm text-gray-500">1 point = KSh 1</p>
                    </div>
                    <p className="text-lg font-bold text-purple-700">KSh {pointsData?.kes_value || profile?.hitty_points || 0}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 text-center font-medium rounded-md transition-colors mt-3"
                >
                  Order History
                </button>
              </div>
              
              {/* Referral Code */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaGift className="mr-2 text-purple-600" />
                  Referral Code
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Share your referral code with friends and both of you will earn 10 Hitty Points when they place their first order.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200">
                  <span className="font-mono text-base text-gray-800 font-medium">
                    {profile?.referral_code || 'No referral code yet'}
                  </span>
                  {profile?.referral_code && (
                    <button
                      onClick={copyReferralCode}
                      className={`p-2 ${codeCopied ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'} rounded-lg hover:bg-opacity-80 transition-colors`}
                      aria-label="Copy referral code"
                    >
                      {codeCopied ? <FaCheckCircle size={18} /> : <FaRegCopy size={18} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaUser className="mr-2 text-purple-600" />
                  Edit Profile
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      We'll use this email to send order updates and receipts.
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
                      Delivery Address
                    </label>
                    <textarea
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your default delivery address"
                    />
                  </div>
                  
                  <div className="border-t border-gray-200 my-6 pt-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <FaLock className="mr-2 text-purple-600" />
                      Change Password
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Leave blank if you don't want to change your password.
                    </p>
                    
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <FaKey size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="password_confirmation" className="block text-gray-700 font-medium mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="password_confirmation"
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <FaKey size={16} />
                        </button>
                      </div>
                      {formData.password && formData.password_confirmation && 
                       formData.password !== formData.password_confirmation && (
                        <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-2 border border-gray-300 rounded-lg mr-3 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className={`px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors ${updating ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Account Preferences */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaShoppingBag className="mr-2 text-purple-600" />
                  Account Preferences
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="font-medium text-gray-800">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive order updates and promotions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="font-medium text-gray-800">SMS Notifications</h3>
                      <p className="text-sm text-gray-500">Receive updates via text message</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">Marketing Communications</h3>
                      <p className="text-sm text-gray-500">Receive offers and promotions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
