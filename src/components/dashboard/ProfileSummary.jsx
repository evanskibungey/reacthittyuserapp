import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaShoppingBag,
  FaCheckCircle
} from 'react-icons/fa';

const ProfileSummary = ({ profile, isLoading }) => {
  if (isLoading || !profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        
        <div className="p-4 md:p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="h-20 w-20 bg-gray-200 animate-pulse rounded-full mb-3"></div>
            <div className="h-6 w-36 bg-gray-200 animate-pulse rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>
          
          <div className="space-y-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full mr-3"></div>
                <div className="w-full">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      <div className="px-4 md:px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          <FaUser className="text-purple-600 mr-2" size={18} />
          <h2 className="text-lg font-semibold text-gray-800">My Profile</h2>
        </div>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xl mb-3">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{profile.name}</h3>
          
          <div className="flex items-center justify-center space-x-2">
            {profile.is_phone_verified && (
              <span className="inline-flex items-center text-xs text-green-800 bg-green-100 px-2 py-1 rounded-full">
                <FaCheckCircle className="mr-1" size={10} /> Verified
              </span>
            )}
            {profile.order_count > 0 && (
              <span className="inline-flex items-center text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded-full">
                <FaShoppingBag className="mr-1" size={10} /> Customer
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="bg-gray-200 p-2 rounded-full mr-3">
              <FaPhone className="text-gray-600" size={14} />
            </div>
            <div>
              <div className="text-xs text-gray-500">Phone Number</div>
              <div className="font-medium text-gray-800">{profile.phone || 'Not provided'}</div>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="bg-gray-200 p-2 rounded-full mr-3">
              <FaEnvelope className="text-gray-600" size={14} />
            </div>
            <div>
              <div className="text-xs text-gray-500">Email Address</div>
              <div className="font-medium text-gray-800">{profile.email || 'Not provided'}</div>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="bg-gray-200 p-2 rounded-full mr-3">
              <FaMapMarkerAlt className="text-gray-600" size={14} />
            </div>
            <div>
              <div className="text-xs text-gray-500">Delivery Address</div>
              <div className="font-medium text-gray-800">{profile.location || 'Not provided'}</div>
            </div>
          </div>
        </div>
        
        <Link 
          to="/profile"
          className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-center text-gray-700 font-medium rounded-lg transition-colors"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
};

export default ProfileSummary;