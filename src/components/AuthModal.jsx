import React, { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaTimes, FaFacebook, FaGoogle, FaMapMarkerAlt, FaGift } from 'react-icons/fa';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose, setIsLoggedIn, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const modalRef = useRef();
  const navigate = useNavigate();

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset form when toggling between login and register
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setLocation('');
    setReferralCode('');
    setConfirmPassword('');
    setError('');
    setValidationErrors({});
  }, [isLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setLoading(true);
    
    try {
      // Call Laravel API to login customer
      const response = await authService.login({ 
        phone, 
        password, 
        remember: rememberMe 
      });
      
      if (response.success) {
        setIsLoggedIn(true);
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.errors) {
        setValidationErrors(err.errors);
      } else {
        setError(err.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setLoading(true);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Call Laravel API to register customer
      const userData = { 
        name, 
        email: email || null, // Make sure null is sent if empty
        phone, 
        password,
        password_confirmation: confirmPassword,
        location: location || null // Make sure null is sent if empty
      };
      
      // Only add referral code if it's provided
      if (referralCode && referralCode.trim()) {
        userData.referral_code = referralCode.trim();
      }
      
      console.log('Sending registration data:', { ...userData, password: '***', password_confirmation: '***' });
      
      const response = await authService.register(userData);
      console.log('Registration response:', response);
      
      if (response.success) {
        setIsLoggedIn(true);
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.message || 'Registration failed');
        
        if (response.errors) {
          setValidationErrors(response.errors);
        }
      }
    } catch (err) {
      console.error('Registration error in component:', err);
      setError(err.message || 'Registration failed. Check browser console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Animation classes
  const modalClasses = isOpen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 opacity-100' 
    : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 opacity-0 pointer-events-none';

  const modalContentClasses = isOpen
    ? 'bg-white rounded-xl shadow-xl transform transition-all duration-300 ease-out w-full max-w-md mx-4'
    : 'bg-white rounded-xl shadow-xl transform transition-all duration-300 scale-95 opacity-0 w-full max-w-md mx-4';

  if (!isOpen) return null;

  return (
    <div className={modalClasses}>
      <div 
        ref={modalRef}
        className={modalContentClasses}
      >
        {/* Modal Header */}
        <div className="relative p-6 border-b">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {isLogin ? 'Customer Login' : 'Customer Registration'}
          </h2>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Divider for visual separation */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Show error message if login fails */}
              {error && (
                <div className="text-red-600 text-sm mb-2">{error}</div>
              )}
              {/* Show validation errors */}
              {validationErrors.phone && (
                <div className="text-red-600 text-sm mb-2">{validationErrors.phone[0]}</div>
              )}
              {validationErrors.password && (
                <div className="text-red-600 text-sm mb-2">{validationErrors.password[0]}</div>
              )}
              {/* Section header for login */}
              <div className="mb-2 text-lg font-semibold text-gray-700 text-center">Sign in to your account</div>
              <div>
                {/* Phone input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                    placeholder="Phone Number"
                    required
                  />
                </div>
              </div>
              <div>
                {/* Password input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                {/* Remember me checkbox */}
                <label className="flex items-center text-sm">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-sm text-purple-600 hover:text-purple-800 transition-colors">
                  Forgot password?
                </a>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:bg-purple-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Show error message if registration fails */}
              {error && (
                <div className="text-red-600 text-sm mb-2">{error}</div>
              )}
              {/* Show validation errors */}
              {Object.keys(validationErrors).map((field) => (
                <div key={field} className="text-red-600 text-sm mb-2">
                  {validationErrors[field][0]}
                </div>
              ))}
              {/* Section header for registration */}
              <div className="mb-2 text-lg font-semibold text-gray-700 text-center">Create your account</div>
              <div>
                {/* Name input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>
              <div>
                {/* Email input (optional) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                    placeholder="Email Address (optional)"
                  />
                </div>
              </div>
              <div>
                {/* Phone input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                    placeholder="Phone Number"
                    required
                  />
                </div>
              </div>
              <div>
                {/* Password input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
              <div>
                {/* Confirm password input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
                {password !== confirmPassword && password && confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
              <div>
                {/* Location input (optional) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                    placeholder="Your Location (optional)"
                  />
                </div>
              </div>
              <div>
                {/* Referral code input (optional) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGift className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                    placeholder="Referral Code (optional)"
                  />
                </div>
              </div>
              <div className="flex items-center">
                {/* Terms and conditions checkbox */}
                <input 
                  id="terms"
                  type="checkbox" 
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I agree to the <a href="#" className="text-purple-600 hover:text-purple-800">Terms of Service</a> and <a href="#" className="text-purple-600 hover:text-purple-800">Privacy Policy</a>
                </label>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:bg-purple-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="p-6 bg-gray-50 border-t rounded-b-xl">
          <p className="text-center text-gray-700">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
