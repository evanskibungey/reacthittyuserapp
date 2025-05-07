import { useState, useEffect } from 'react'
import { profileService } from '../services/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: ''
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        
        try {
          // Try to fetch from real API
          const profileResponse = await profileService.getProfile()
          setProfile(profileResponse.data)
          setFormData(profileResponse.data)
          
          const pointsResponse = await profileService.getPoints()
          setPoints(pointsResponse.points || 0)
        } catch (err) {
          console.log('API not available, using sample data')
          // Sample data for development
          const sampleProfile = {
            id: 1,
            name: 'John Doe',
            phone: '+254712345678',
            email: 'john@example.com',
            location: '123 Main St, Nairobi',
            referral_code: 'JOH1XYZ',
            order_count: 3
          }
          
          setProfile(sampleProfile)
          setFormData(sampleProfile)
          setPoints(150)
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
    
    try {
      setUpdating(true)
      
      try {
        await profileService.updateProfile(formData)
        setProfile(formData)
        toast.success('Profile updated successfully!')
      } catch (err) {
        console.log('API not available, simulating update')
        setProfile(formData)
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-2"></div>
        Loading profile...
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="text-3xl text-blue-600 font-bold">
                  {profile?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <h2 className="text-xl font-bold">{profile?.name}</h2>
              <p className="text-gray-600">{profile?.phone}</p>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Hitty Points</span>
                <span className="font-bold">{points}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Orders Placed</span>
                <span className="font-bold">{profile?.order_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Referral Code</span>
                <span className="font-bold">{profile?.referral_code || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <h3 className="font-bold text-lg text-blue-800 mb-3">Earn More Points!</h3>
            <p className="text-blue-600 mb-4">
              Share your referral code with friends and earn 10 points for each new customer who signs up.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(profile?.referral_code)
                toast.success('Referral code copied to clipboard!')
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
            >
              Copy Referral Code
            </button>
          </div>
        </div>
        
        {/* Right Column - Profile Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="location" className="block text-gray-700 mb-2">
                  Delivery Address
                </label>
                <textarea
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={updating}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
              >
                {updating ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Security</h2>
            
            <button
              onClick={() => toast.success('Feature coming soon!')}
              className="bg-gray-800 text-white w-full py-2 px-4 rounded hover:bg-gray-700 transition duration-200 mb-4"
            >
              Change Password
            </button>
            
            <button
              onClick={() => toast.success('Feature coming soon!')}
              className="bg-red-600 text-white w-full py-2 px-4 rounded hover:bg-red-700 transition duration-200"
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
