import React, { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaTimes, FaMapMarkerAlt, FaGift, 
         FaArrowRight, FaCheck } from 'react-icons/fa';
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
  const [agreeToTerms, setAgreeToTerms] = useState(false);
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
    setAgreeToTerms(false);
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
      
      const response = await authService.register(userData);
      
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
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300 opacity-100' 
    : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-300 opacity-0 pointer-events-none';

  const modalContentClasses = isOpen
    ? 'bg-white rounded-xl shadow-lg transform transition-all duration-300 ease-out w-full max-w-4xl mx-4 overflow-hidden'
    : 'bg-white rounded-xl shadow-lg transform transition-all duration-300 scale-95 opacity-0 w-full max-w-4xl mx-4 overflow-hidden';

  if (!isOpen) return null;

  return (
    <div className={modalClasses}>
      <div 
        ref={modalRef}
        className={modalContentClasses}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20 bg-white rounded-full p-2 hover:shadow-md"
          aria-label="Close modal"
        >
          <FaTimes size={16} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Panel - Branding and Welcome Message */}
          <div className="md:w-5/12 bg-gradient-to-br from-[#8e44ad] to-[#6c3483] text-white p-8 flex flex-col justify-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
            
            {/* Logo */}
            <div className="flex items-center mb-6">
              <img 
                src="/logo.png" 
                alt="Hitty Deliveries" 
                className="h-12 mr-3"
              />
            </div>
            
            {/* Welcome message */}
            <h3 className="text-xl font-bold mb-4">
              {isLogin ? "Welcome Back!" : "Join Our Community!"}
            </h3>
            <p className="mb-6 text-purple-100">
              {isLogin 
                ? "Log in to access your account and enjoy fast, reliable delivery services." 
                : "Create an account to get started with our convenient gas delivery service."
              }
            </p>
            
            {/* Benefits list */}
            <div className="space-y-3 mt-2">
              <div className="flex items-center">
                <div className="bg-[#e67e22] bg-opacity-30 p-1 rounded-full mr-3">
                  <FaCheck className="text-white" size={12} />
                </div>
                <span className="text-sm">Fast delivery within 60 minutes</span>
              </div>
              <div className="flex items-center">
                <div className="bg-[#e67e22] bg-opacity-30 p-1 rounded-full mr-3">
                  <FaCheck className="text-white" size={12} />
                </div>
                <span className="text-sm">Earn loyalty points with every order</span>
              </div>
              <div className="flex items-center">
                <div className="bg-[#e67e22] bg-opacity-30 p-1 rounded-full mr-3">
                  <FaCheck className="text-white" size={12} />
                </div>
                <span className="text-sm">Quality products from trusted brands</span>
              </div>
            </div>
            
            {/* Toggle between login and register */}
            <div className="mt-8 text-center">
              <p className="text-sm text-purple-200 mb-2">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="inline-flex items-center text-white bg-[#e67e22] bg-opacity-30 hover:bg-opacity-40 px-4 py-2 rounded-lg transition-all duration-300"
              >
                {isLogin ? "Create Account" : "Sign In"} 
                <FaArrowRight className="ml-2" size={12} />
              </button>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="md:w-7/12 p-8 bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isLogin ? 'Sign In' : 'Create your account'}
            </h2>
            
            {/* Error messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            {/* Validation errors */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                <ul className="list-disc pl-5">
                  {Object.keys(validationErrors).map((field) => (
                    <li key={field}>{validationErrors[field][0]}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Phone input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e44ad] focus:border-transparent bg-gray-50"
                    placeholder="Phone Number"
                    required
                  />
                </div>
                
                {/* Password input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e44ad] focus:border-transparent bg-gray-50"
                    placeholder="Password"
                    required
                  />
                </div>
                
                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="w-4 h-4 text-[#8e44ad] border-gray-300 rounded focus:ring-[#8e44ad]"
                    />
                    <span className="ml-2 text-gray-700">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-[#8e44ad] hover:text-[#6c3483] transition-colors">
                    Forgot password?
                  </a>
                </div>
                
                {/* Submit button */}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8e44ad] hover:bg-[#6c3483] text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md disabled:bg-purple-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="relative md:col-span-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e44ad] focus:border-transparent bg-gray-50"
                    placeholder="Full Name"
                    required
                  />
                </div>
                
                {/* Email (optional) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e44ad] focus:border-transparent bg-gray-50"
                    placeholder="Email Address (optional)"
                  />
                </div>
                
                {/* Phone */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e44ad] focus:border-transparent bg-gray-50"
                    placeholder="Phone Number"
                    required
                  />
                </div>
                
                {/* Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e44ad] focus:border-transparent bg-gray-50"
                    placeholder="Password"
                    required
                  />
                </div>
                
                {/* Confirm Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e44ad] focus:border-transparent bg-gray-50"
                    placeholder="Confirm Password"
                    required
                  />
                  {password !== confirmPassword && password && confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
                
                {/* Location (optional) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e44ad] focus:border-transparent bg-gray-50"
                    placeholder="Your Location (optional)"
                  />
                </div>
                
                {/* Referral Code (optional) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGift className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                    placeholder="Referral Code (optional)"
                  />
                </div>
                
                {/* Terms and Conditions */}
                <div className="flex items-start md:col-span-2 mt-2">
                  <input 
                    id="terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={() => setAgreeToTerms(!agreeToTerms)}
                    className="mt-1 w-4 h-4 text-[#8e44ad] border-gray-300 rounded focus:ring-[#8e44ad]"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                    I agree to the <a href="#" className="text-[#e67e22] hover:text-[#d35400] underline">Terms of Service</a> and <a href="#" className="text-[#e67e22] hover:text-[#d35400] underline">Privacy Policy</a>
                  </label>
                </div>
                
                {/* Submit button */}
                <button 
                  type="submit"
                  disabled={loading || !agreeToTerms}
                  className="md:col-span-2 mt-2 bg-[#e67e22] hover:bg-[#d35400] text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md disabled:bg-orange-300 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;